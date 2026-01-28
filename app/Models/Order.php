<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Order extends Model
{
    use LogsActivity; // <--- Pasang CCTV

    protected $guarded = [];

    // Konfigurasi Logging
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Order ini telah di-{$eventName}");
    }

    // Relasi ke Klien
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    // Relasi ke Layanan
    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    // Relasi ke Detail PPAT
    public function ppat_detail()
    {
        return $this->hasOne(OrderPpatDetail::class);
    }

    // Relasi ke File Arsip
    public function files()
    {
        return $this->hasMany(OrderFile::class);
    }
}
