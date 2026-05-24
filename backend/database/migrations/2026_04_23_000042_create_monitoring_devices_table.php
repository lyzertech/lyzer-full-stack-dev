<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('monitoring_devices', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('facility_id');
            $table->string('name', 255);
            $table->string('device_code', 100)->unique()->comment('Serial Number or Asset Tag');
            $table->string('device_type', 100)->nullable()->comment('Meter, Gateway, Sensor, Inverter');
            $table->string('brand', 100)->nullable();
            $table->string('model', 100)->nullable();
            $table->string('firmware_version', 50)->nullable();
            
            // Network & Connectivity — General
            $table->string('ip_address', 45)->nullable()->comment('IPv4 or IPv6 — used by Modbus TCP, MQTT, SNMP, HTTP, OPC-UA');
            $table->unsignedSmallInteger('port')->nullable()->comment('TCP/UDP port — Modbus TCP:502, MQTT:1883/8883, SNMP:161, OPC-UA:4840, HTTP:80/443');
            $table->string('mac_address', 17)->nullable()->comment('MAC address in XX:XX:XX:XX:XX:XX format');
            $table->enum('connection_type', ['Ethernet', 'WiFi', 'RS485', 'RS232', 'LoRaWAN', 'Cellular', 'Bluetooth', 'USB'])->default('Ethernet');
            $table->enum('protocol', ['Modbus-TCP', 'Modbus-RTU', 'MQTT', 'HTTP', 'HTTPS', 'SNMP', 'OPC-UA', 'DNP3', 'BACnet', 'IEC-61850'])->nullable();

            // Modbus RTU / RS485 Parameters
            $table->unsignedTinyInteger('modbus_slave_id')->nullable()->comment('Modbus slave/unit ID — 1–247');
            $table->enum('modbus_baudrate', ['1200', '2400', '4800', '9600', '19200', '38400', '57600', '115200'])->nullable()->comment('Serial baud rate for Modbus RTU');
            $table->enum('modbus_parity', ['None', 'Even', 'Odd'])->nullable()->comment('Serial parity for Modbus RTU');
            $table->enum('modbus_stop_bits', ['1', '2'])->nullable()->comment('Serial stop bits for Modbus RTU');
            $table->enum('modbus_data_bits', ['7', '8'])->nullable()->default('8')->comment('Serial data bits for Modbus RTU');

            // MQTT Parameters
            $table->string('mqtt_broker_host', 255)->nullable()->comment('MQTT broker hostname or IP');
            $table->string('mqtt_client_id', 128)->nullable()->comment('Unique MQTT client identifier');
            $table->string('mqtt_topic_pub', 255)->nullable()->comment('MQTT topic to publish data');
            $table->string('mqtt_topic_sub', 255)->nullable()->comment('MQTT topic to subscribe for commands');
            $table->string('mqtt_username', 128)->nullable()->comment('MQTT broker username');
            $table->string('mqtt_password', 255)->nullable()->comment('MQTT broker password (store encrypted)');
            $table->boolean('mqtt_tls_enabled')->default(false)->comment('Use TLS/SSL for MQTT connection');
            $table->enum('mqtt_qos', ['0', '1', '2'])->nullable()->default('1')->comment('MQTT Quality of Service level');

            // SNMP Parameters
            $table->enum('snmp_version', ['v1', 'v2c', 'v3'])->nullable()->comment('SNMP protocol version');
            $table->string('snmp_community', 128)->nullable()->comment('SNMP community string — v1/v2c');
            $table->string('snmp_username', 128)->nullable()->comment('SNMP v3 security username');
            $table->enum('snmp_auth_protocol', ['MD5', 'SHA', 'SHA-256', 'SHA-512'])->nullable()->comment('SNMP v3 authentication protocol');
            $table->string('snmp_auth_password', 255)->nullable()->comment('SNMP v3 auth password (store encrypted)');
            $table->enum('snmp_priv_protocol', ['DES', 'AES', 'AES-256'])->nullable()->comment('SNMP v3 privacy/encryption protocol');
            $table->string('snmp_priv_password', 255)->nullable()->comment('SNMP v3 privacy password (store encrypted)');

            // OPC-UA Parameters
            $table->string('opcua_endpoint_url', 512)->nullable()->comment('OPC-UA endpoint URL e.g. opc.tcp://host:4840/');
            $table->string('opcua_namespace_uri', 255)->nullable()->comment('OPC-UA namespace URI');
            $table->enum('opcua_security_mode', ['None', 'Sign', 'SignAndEncrypt'])->nullable()->comment('OPC-UA message security mode');
            $table->string('opcua_security_policy', 128)->nullable()->comment('OPC-UA security policy URI');

            // HTTP / REST API Parameters
            $table->string('http_base_url', 512)->nullable()->comment('Base URL for HTTP/REST endpoints');
            $table->enum('http_auth_type', ['None', 'Basic', 'Bearer', 'API-Key', 'OAuth2'])->nullable()->comment('HTTP authentication method');
            $table->string('http_api_key', 512)->nullable()->comment('API key or Bearer token (store encrypted)');
            $table->unsignedSmallInteger('http_poll_interval_sec')->nullable()->default(60)->comment('HTTP polling interval in seconds');

            // LoRaWAN Parameters
            $table->string('lorawan_dev_eui', 16)->nullable()->comment('LoRaWAN device EUI (16 hex chars)');
            $table->string('lorawan_app_eui', 16)->nullable()->comment('LoRaWAN application EUI (16 hex chars)');
            $table->string('lorawan_app_key', 32)->nullable()->comment('LoRaWAN application key (32 hex chars, store encrypted)');
            $table->enum('lorawan_class', ['A', 'B', 'C'])->nullable()->comment('LoRaWAN device class');

            // Protocol-specific extended config (catch-all for edge cases)
            $table->json('protocol_config')->nullable()->comment('Extra protocol params: register maps, custom topics, TLS certs paths, etc.');
            
            $table->enum('status', ['Online', 'Offline', 'Warning', 'Inactive'])->default('Inactive');
            $table->integer('signal_strength')->nullable()->comment('0-100 percentage');
            $table->timestamp('last_heartbeat_at')->nullable();
            
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('facility_id')->references('id')->on('monitoring_facilities')->onDelete('cascade');
            $table->index(['device_type']);
            $table->index(['status']);
            $table->index(['protocol']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('monitoring_devices');
    }
};
