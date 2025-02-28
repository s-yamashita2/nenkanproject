from django.shortcuts import render
from django.http import JsonResponse
from django.urls import reverse_lazy
from django.views.generic import ListView, DeleteView
from django.views.decorators.csrf import csrf_exempt
from django.views import View
import json
from .models import Memo


# ✅ カレンダーのトップページ（クラスベースビュー）
class IndexView(ListView):
    template_name = "index.html"
    model = Memo


# ✅ メモ一覧表示（クラスベースビュー）
class MemoListView(ListView):
    model = Memo
    template_name = "memo_list.html"
    context_object_name = "memos"
    ordering = ["-date", "-id"]  # 📌 日付の降順（新しい順）





# ✅ メモを保存するAPI
@csrf_exempt
def save_memo(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            date = data.get("date")
            text = data.get("text", "").strip()

            if not date or not text:
                return JsonResponse({"error": "日付またはメモが空です"}, status=400)

            Memo.objects.create(date=date, text=text)

            return JsonResponse({"message": "メモを保存しました", "date": date, "text": text}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "POSTリクエストのみ対応しています"}, status=400)


# ✅ メモを取得するAPI
def get_memos(request):
    memos = {}
    for memo in Memo.objects.all():
        if memo.date not in memos:
            memos[memo.date] = []
        memos[memo.date].append(memo.text)  # メモをリストで保存

    return JsonResponse({"memos": memos})


# ✅ メモを削除するAPI
@csrf_exempt
def delete_memo(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            date = data.get("date")
            text = data.get("text", "").strip()

            if not date or not text:
                return JsonResponse({"error": "日付またはメモが空です"}, status=400)

            memo = Memo.objects.filter(date=date, text=text).first()
            if memo:
                memo.delete()
                return JsonResponse({"message": "メモを削除しました"}, status=200)
            else:
                return JsonResponse({"error": "該当のメモが見つかりません"}, status=404)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "POSTリクエストのみ対応しています"}, status=400)

from django.urls import reverse_lazy
from django.views.generic import DeleteView
from .models import Memo

class MemoDeleteView(DeleteView):
    model = Memo
    template_name = "memo_confirm_delete.html"
    success_url = reverse_lazy("nenkanapp:memo_list")  # ✅ アプリ名を含める
