<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Company extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty()->setDescriptionForEvent(fn(string $eventName) => "Pengaturan Kantor telah di-{$eventName}");
    }
    protected $fillable = [
        'name',
        'notary_name',
        'sk_number',      // [BARU]
        'address',
        'phone',
        'email',
        'bank_name',
        'account_number',
        'account_name',
        'logo_path',
        'staff_data',
    ];

    protected $casts = [
        'staff_data' => 'array',
    ];
}
