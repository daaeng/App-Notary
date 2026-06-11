<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Service extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logAll()->logOnlyDirty()->setDescriptionForEvent(fn(string $eventName) => "Layanan/Persyaratan telah di-{$eventName}");
    }
    protected $guarded = [];

    public function type()
    {
        return $this->belongsTo(ServiceType::class, 'service_type_id');
    }
}
