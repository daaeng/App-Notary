<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Inventory extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty()->setDescriptionForEvent(fn(string $eventName) => "Inventaris telah di-{$eventName}");
    }
    protected $guarded = [];

    // Relasi: 1 Barang punya banyak Log Riwayat
    public function logs()
    {
        return $this->hasMany(InventoryLog::class)->latest();
    }
}
