<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Order extends Model
{
    use LogsActivity;

    protected $guarded = [];

    // Konfigurasi Logging CCTV
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

    // --- INI YANG TADI HILANG ---
    // Relasi ke Pembayaran (Payments)
    public function payments()
    {
        // Satu Order punya Banyak Pembayaran, urutkan dari yang terbaru
        return $this->hasMany(Payment::class)->latest();
    }
}
