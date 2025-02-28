from django.db import models

# Create your models here.
from django.db import models

class Memo(models.Model):
    date = models.CharField(max_length=10)  # 例: "2025-01-15"
    text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)  # メモの作成日時

    def __str__(self):
        return f"{self.date}: {self.text[:20]}"  # 先頭20文字を表示
