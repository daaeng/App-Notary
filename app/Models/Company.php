<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
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
    ];
}
