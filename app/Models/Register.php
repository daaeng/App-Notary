<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Register extends Model
{
    use HasFactory, LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty()->setDescriptionForEvent(fn(string $eventName) => "Buku Register telah di-{$eventName}");
    }

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
