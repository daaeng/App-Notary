<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'amount',
        'payment_date',
        'payment_method',
        'proof_file',
        'note',
        'created_by',
    ];

    // Relasi balik ke Order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Relasi ke User (Siapa yang input)
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
