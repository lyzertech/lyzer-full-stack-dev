<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MigrateDataFromMySQL extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'migrate:mysql-to-pgsql {--batch=1000 : Batch size for processing} {--table= : Specific table to migrate}';

    /**
     * The console command description.
     */
    protected $description = 'Migrate data from MySQL to PostgreSQL';

    /**
     * Tables to skip during migration
     */
    protected $skipTables = [
        'migrations',
        'sessions', 
        'cache',
        'cache_locks',
        'jobs',
        'job_batches',
        'failed_jobs',
    ];

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚚 Starting data migration from MySQL to PostgreSQL...');
        
        $batchSize = $this->option('batch');
        $specificTable = $this->option('table');
        
        // Get all tables from MySQL source
        $tables = $this->getTables();
        
        if ($specificTable) {
            if (in_array($specificTable, $tables)) {
                $tables = [$specificTable];
                $this->info("Migrating specific table: {$specificTable}");
            } else {
                $this->error("Table {$specificTable} not found!");
                return 1;
            }
        }
        
        $this->info("Found " . count($tables) . " tables to migrate");
        
        $totalRecords = 0;
        $failedTables = [];
        
        foreach ($tables as $table) {
            if (in_array($table, $this->skipTables)) {
                $this->warn("Skipping system table: {$table}");
                continue;
            }
            
            try {
                $this->info("\n📋 Processing table: {$table}");
                $records = $this->migrateTable($table, $batchSize);
                $totalRecords += $records;
                $this->info("✅ Migrated {$records} records from {$table}");
            } catch (\Exception $e) {
                $this->error("❌ Failed to migrate table {$table}: " . $e->getMessage());
                $failedTables[] = $table;
            }
        }
        
        $this->info("\n🎉 Migration completed!");
        $this->info("Total records migrated: {$totalRecords}");
        
        if (count($failedTables) > 0) {
            $this->warn("Failed tables: " . implode(', ', $failedTables));
        }
        
        // Verify migration
        $this->verifyMigration();
        
        return 0;
    }
    
    private function getTables()
    {
        $tables = DB::connection('mysql_source')
            ->select('SHOW TABLES');
        
        $tableNames = [];
        $dbName = 'Tables_in_lyzer-full';
        
        foreach ($tables as $table) {
            $tableNames[] = $table->$dbName;
        }
        
        return $tableNames;
    }
    
    private function migrateTable($table, $batchSize)
    {
        // Check if table exists in PostgreSQL
        if (!Schema::connection('pgsql')->hasTable($table)) {
            $this->warn("Table {$table} does not exist in PostgreSQL, skipping...");
            return 0;
        }
        
        // Get total records count
        $totalCount = DB::connection('mysql_source')->table($table)->count();
        
        if ($totalCount == 0) {
            $this->info("Table {$table} is empty, skipping...");
            return 0;
        }
        
        $this->info("Total records in {$table}: {$totalCount}");
        
        $processedCount = 0;
        $progressBar = $this->output->createProgressBar($totalCount);
        $progressBar->start();
        
        // Clear target table first
        DB::connection('pgsql')->table($table)->truncate();
        
        // Process in batches
        DB::connection('mysql_source')->table($table)
            ->orderBy('id')
            ->chunk($batchSize, function ($records) use ($table, &$processedCount, $progressBar) {
                $data = [];
                
                foreach ($records as $record) {
                    $recordArray = (array) $record;
                    
                    // Handle data type conversions
                    $recordArray = $this->convertDataTypes($recordArray);
                    
                    $data[] = $recordArray;
                }
                
                // Insert batch to PostgreSQL
                DB::connection('pgsql')->table($table)->insert($data);
                
                $processedCount += count($data);
                $progressBar->advance(count($data));
            });
        
        $progressBar->finish();
        $this->newLine();
        
        return $processedCount;
    }
    
    private function convertDataTypes($record)
    {
        foreach ($record as $key => $value) {
            // Handle boolean conversion
            if (is_numeric($value) && ($value === 0 || $value === 1) && 
                (strpos($key, 'is_') === 0 || strpos($key, '_enabled') !== false || 
                 strpos($key, '_verified') !== false || strpos($key, '_active') !== false)) {
                $record[$key] = (bool) $value;
            }
            
            // Handle NULL values
            if ($value === '' && !in_array($key, ['password', 'email', 'name'])) {
                $record[$key] = null;
            }
        }
        
        return $record;
    }
    
    private function verifyMigration()
    {
        $this->info("\n🔍 Verifying migration...");
        
        $tables = ['auth_users', 'auth_roles', 'finance_transactions', 'engineering_tasks'];
        
        foreach ($tables as $table) {
            if (Schema::connection('pgsql')->hasTable($table)) {
                $mysqlCount = DB::connection('mysql_source')->table($table)->count();
                $pgsqlCount = DB::connection('pgsql')->table($table)->count();
                
                if ($mysqlCount === $pgsqlCount) {
                    $this->info("✅ {$table}: {$pgsqlCount} records (OK)");
                } else {
                    $this->warn("⚠️ {$table}: MySQL({$mysqlCount}) != PostgreSQL({$pgsqlCount})");
                }
            }
        }
    }
}
