<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->date('completed_at')->nullable()->after('status');
        });

        // Set completed_at for existing done orders
        DB::statement("UPDATE orders SET completed_at = DATE(updated_at) WHERE status = 'done'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('completed_at');
        });
    }
};
