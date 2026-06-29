<?php

namespace Tests\Feature\Modules\{{ModuleName}};

use Tests\TestCase;
use App\Models\User;
use App\Modules\{{ModuleName}}\Models\{{ModelName}};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

/**
 * {{ModelName}} Controller Test
 * Following Lyzer testing patterns
 * Tests for: {{ModuleName}} module
 */
class {{ModelName}}ControllerTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected ${{modelNameLower}};
    protected $baseUrl;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create authenticated user with proper role
        $this->user = User::factory()->create(['role' => '{{moduleName}}']);
        
        // Create test data
        $this->{{modelNameLower}} = {{ModelName}}::factory()->create();
        
        // Set base URL for API testing
        $this->baseUrl = '/api/{{moduleName}}/{{resourceName}}';
    }

    /** @test */
    public function it_can_list_{{resourceName}}()
    {
        // Arrange
        {{ModelName}}::factory(3)->create();
        
        // Act
        $response = $this->actingAs($this->user)
            ->getJson($this->baseUrl);
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => [
                        'id',
                        'created_at',
                        'updated_at'
                        // Add more fields as needed
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_create_{{modelNameLower}}()
    {
        // Arrange
        $data = [
            // Add your test data here
            // 'name' => $this->faker->word,
            // 'description' => $this->faker->sentence,
        ];
        
        // Act
        $response = $this->actingAs($this->user)
            ->postJson($this->baseUrl, $data);
        
        // Assert
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => '{{ModelName}} created successfully'
            ]);
            
        $this->assertDatabaseHas('{{tableName}}', $data);
    }

    /** @test */
    public function it_can_show_{{modelNameLower}}()
    {
        // Act
        $response = $this->actingAs($this->user)
            ->getJson($this->baseUrl . '/' . $this->{{modelNameLower}}->id);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $this->{{modelNameLower}}->id
                ]
            ]);
    }

    /** @test */
    public function it_can_update_{{modelNameLower}}()
    {
        // Arrange
        $updateData = [
            // Add your update data here
            // 'name' => $this->faker->word,
        ];
        
        // Act
        $response = $this->actingAs($this->user)
            ->putJson($this->baseUrl . '/' . $this->{{modelNameLower}}->id, $updateData);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => '{{ModelName}} updated successfully'
            ]);
            
        $this->assertDatabaseHas('{{tableName}}', array_merge(
            ['id' => $this->{{modelNameLower}}->id],
            $updateData
        ));
    }

    /** @test */
    public function it_can_delete_{{modelNameLower}}()
    {
        // Act
        $response = $this->actingAs($this->user)
            ->deleteJson($this->baseUrl . '/' . $this->{{modelNameLower}}->id);
        
        // Assert
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => '{{ModelName}} deleted successfully'
            ]);
            
        $this->assertSoftDeleted('{{tableName}}', ['id' => $this->{{modelNameLower}}->id]);
    }

    /** @test */
    public function it_requires_authentication()
    {
        // Act
        $response = $this->getJson($this->baseUrl);
        
        // Assert
        $response->assertStatus(401);
    }

    /** @test */
    public function it_requires_proper_role()
    {
        // Arrange
        $wrongRoleUser = User::factory()->create(['role' => 'different_role']);
        
        // Act
        $response = $this->actingAs($wrongRoleUser)
            ->getJson($this->baseUrl);
        
        // Assert
        $response->assertStatus(403);
    }

    /** @test */
    public function it_validates_create_request()
    {
        // Act - Send empty data
        $response = $this->actingAs($this->user)
            ->postJson($this->baseUrl, []);
        
        // Assert
        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                // Add your required fields here
                // 'name',
                // 'description'
            ]);
    }

    /** @test */
    public function it_returns_404_for_nonexistent_{{modelNameLower}}()
    {
        // Act
        $response = $this->actingAs($this->user)
            ->getJson($this->baseUrl . '/999999');
        
        // Assert
        $response->assertStatus(404);
    }
}