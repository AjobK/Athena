<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePostTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('Post', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->string('title');
            $table->string('path')->unique();
            $table->longText('content')->nullable();
            $table->text('description')->nullable();
            
            $table->timestamps();
            $table->softDeletes();
            $table->timestamp('hidden_at')->nullable();
            $table->timestamp('published_at')->nullable();

            $table->foreign('user_id')
            ->references('id')
            ->on('User');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('Post', function (Blueprint $table) {
            $table->dropForeign('post_user_id_foreign');
        });
        Schema::dropIfExists('Post');
    }
}
