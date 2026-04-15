<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Order extends Model
{
    use LogsActivity;

    protected $guarded = [];

    // --- TAMBAHAN BARU: AGAR LARAVEL BISA MEMBACA INPUTAN SHARLOCK/NO HP ---
    protected $casts = [
        'additional_info' => 'array',
    ];

    // Konfigurasi Logging CCTV
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logAll()
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Order ini telah di-{$eventName}");
    }

    // Relasi
    public function client() { return $this->belongsTo(Client::class); }
    public function service() { return $this->belongsTo(Service::class); }
    public function ppat_detail() { return $this->hasOne(OrderPpatDetail::class); }
    public function files() { return $this->hasMany(OrderFile::class); }
    public function payments() { return $this->hasMany(Payment::class)->latest(); }
}
