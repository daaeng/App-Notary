<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $guarded = [];

    // Casting agar 'transaction_date' dibaca sebagai format tanggal
    protected $casts = [
        'transaction_date' => 'date',
    ];
}
