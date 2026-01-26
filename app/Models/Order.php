<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $guarded = [];

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

    // Relasi ke Detail PPAT (Opsional, ada jika layanan = PPAT)
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
