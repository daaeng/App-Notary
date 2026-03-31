<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Register extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Casting tanggal agar sinkron dengan format Date di React
    protected $casts = [
        'tanggal_akta' => 'date:Y-m-d',
        'tanggal' => 'date:Y-m-d',
        'tanggal_wesel' => 'date:Y-m-d',
        'tanggal_jatuh_waktu' => 'date:Y-m-d',
        'tanggal_surat' => 'date:Y-m-d',
        'tanggal_didaftarkan' => 'date:Y-m-d',
    ];
}
