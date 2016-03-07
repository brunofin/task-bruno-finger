# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-03-07 14:14
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='CloudSystemFile',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('size', models.PositiveIntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='CloudSystemFolder',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('path', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='filestorage.CloudSystemFolder')),
            ],
        ),
        migrations.AddField(
            model_name='cloudsystemfile',
            name='path',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='filestorage.CloudSystemFolder'),
        ),
    ]
