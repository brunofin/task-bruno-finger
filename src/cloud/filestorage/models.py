from __future__ import unicode_literals

from django.db import models

class CloudSystemFolder(models.Model):
    name = models.CharField(max_length=255)
    path = models.ForeignKey('CloudSystemFolder', on_delete=models.CASCADE, null=True)

class CloudSystemFile(models.Model):
    name = models.CharField(max_length=255)
    size = models.PositiveIntegerField()
    path = models.ForeignKey('CloudSystemFolder', on_delete=models.CASCADE)
