<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixDatabaseSequences extends Command
{
    protected $signature = 'db:fix-sequences 
                            {--table= : Fix sequence for specific table only}
                            {--dry-run : Show what would be fixed without making changes}';

    protected $description = 'Fix PostgreSQL auto-increment sequences that are out of sync with actual data';

    public function handle()
    {
        $this->info('🔍 Checking PostgreSQL sequences...');

        if ($this->option('table')) {
            $this->fixSingleTable($this->option('table'));
        } else {
            $this->fixAllSequences();
        }

        $this->info('✅ Sequence check completed!');
    }

    private function fixAllSequences()
    {
        // Get all tables with auto-increment sequences
        $tables = $this->getTablesWithSequences();
        
        $fixedCount = 0;
        $skippedCount = 0;

        foreach ($tables as $table) {
            $result = $this->checkAndFixSequence($table);
            if ($result['fixed']) {
                $fixedCount++;
            } else {
                $skippedCount++;
            }
        }

        $this->info("📊 Summary:");
        $this->info("   - Fixed: {$fixedCount} tables");
        $this->info("   - Skipped: {$skippedCount} tables (already correct)");
    }

    private function fixSingleTable(string $tableName)
    {
        $this->info("🔧 Checking table: {$tableName}");
        $result = $this->checkAndFixSequence($tableName);
        
        if ($result['fixed']) {
            $this->info("✅ Fixed sequence for {$tableName}");
        } else {
            $this->info("ℹ️  Sequence for {$tableName} is already correct");
        }
    }

    private function getTablesWithSequences(): array
    {
        // Get all tables that have auto-increment primary keys (sequences)
        $query = "
            SELECT t.table_name
            FROM information_schema.tables t
            JOIN information_schema.columns c ON t.table_name = c.table_name
            WHERE t.table_schema = 'public' 
            AND t.table_type = 'BASE TABLE'
            AND c.column_name = 'id'
            AND c.column_default LIKE 'nextval%'
            ORDER BY t.table_name
        ";

        $results = DB::select($query);
        return array_map(fn($row) => $row->table_name, $results);
    }

    private function checkAndFixSequence(string $tableName): array
    {
        try {
            // Check if table exists and has records
            $recordCount = DB::table($tableName)->count();
            
            if ($recordCount === 0) {
                $this->line("   - {$tableName}: Empty table, skipping");
                return ['fixed' => false, 'reason' => 'empty'];
            }

            // Get current max ID
            $maxId = DB::table($tableName)->max('id') ?? 0;
            
            // Get current sequence value
            $sequenceQuery = "SELECT currval(pg_get_serial_sequence('{$tableName}', 'id')) as current_val";
            $currentSeqVal = DB::select($sequenceQuery)[0]->current_val ?? 0;

            $this->line("   - {$tableName}: Records={$recordCount}, MaxID={$maxId}, SeqVal={$currentSeqVal}");

            // Check if sequence needs fixing
            if ($currentSeqVal >= $maxId) {
                $this->line("     ✓ Sequence is correct");
                return ['fixed' => false, 'reason' => 'correct'];
            }

            // Fix the sequence
            if (!$this->option('dry-run')) {
                $fixQuery = "SELECT setval(pg_get_serial_sequence('{$tableName}', 'id'), {$maxId})";
                DB::select($fixQuery);
                $this->line("     🔧 Fixed sequence: {$currentSeqVal} → {$maxId}");
            } else {
                $this->line("     🔧 Would fix sequence: {$currentSeqVal} → {$maxId}");
            }

            return ['fixed' => true, 'old' => $currentSeqVal, 'new' => $maxId];

        } catch (\Exception $e) {
            $this->error("   ❌ Error with {$tableName}: " . $e->getMessage());
            return ['fixed' => false, 'reason' => 'error'];
        }
    }
}