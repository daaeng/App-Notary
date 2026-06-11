<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Schedule extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty()->setDescriptionForEvent(fn(string $eventName) => "Jadwal telah di-{$eventName}");
    }
    protected $guarded = [];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];
}
