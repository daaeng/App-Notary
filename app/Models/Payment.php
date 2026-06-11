<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Payment extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty()->setDescriptionForEvent(fn(string $eventName) => "Pembayaran telah di-{$eventName}");
    }

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
