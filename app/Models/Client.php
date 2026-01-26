<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    // Kita proteksi ID saja, sisanya boleh diisi massal
    protected $guarded = ['id'];

    // Casting tipe data otomatis
    protected $casts = [
        'is_active' => 'boolean',
    ];
}
