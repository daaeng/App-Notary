<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = [
        'name',
        'notary_name',
        'address',
        'phone',
        'email',
    ];
}
