from django.shortcuts import render
from . import models
from django.contrib.auth import get_user_model
from . import serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes

from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema


# Create your views here.

def add_tag(request):
    # article이랑 똑같이 crudㄱ
    pass


def del_tag(request):
    # article이랑 똑같이 crudㄱ
    pass


User = get_user_model()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create(request):
    new_article = serializers.ArticleSerializer(data=request.data)
    # 태그는 string으로 받아서 split하기->for로 중복확인/저장(추가 필요)
    if new_article.is_valid(raise_exception=True):
        new_article.save(user=request.user)
        return Response(new_article.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def articlesAll(request):
    # 스크롤할 때마다 게시물 불러오기(추가 필요)
    user = request.user
    articles = models.Article.objects.order_by('-pk')
    articles_All = []
    for article in articles:
        data = {}
        if article.like_users.filter(id=user.id).exists():
            data['isliked'] = True
        else:
            data['isliked'] = False

        serializer = serializers.ArticleSerializer(
            article, data=data, partial=True)

        if article.num_of_like > 2:
            for likeuser in article.like_users.order_by('-pk'):
                if user.followings.filter(id=likeuser.id).exists():
                    user_1 = likeuser
                    break
            else:
                user_1 = article.like_users.last()

            if serializer.is_valid(raise_exception=True):
                serializer.save(user_1=user_1)
                articles_All.append(serializer.data)

        elif article.num_of_like == 2:
            if request.user != article.like_users.last():
                user_1 = article.like_users.last()
                user_2 = article.like_users.first()
            else:
                user_1 = article.like_users.first()
                user_2 = article.like_users.last()
            if serializer.is_valid(raise_exception=True):
                serializer.save(user_1=user_1, user_2=user_2)
                articles_All.append(serializer.data)
        elif article.num_of_like == 1:
            user_1 = article.like_users.last()
            if serializer.is_valid(raise_exception=True):
                serializer.save(user_1=user_1)
                articles_All.append(serializer.data)
        else:
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                articles_All.append(serializer.data)

    return Response(articles_All)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def articleLikeBtn(request):
    user = request.user
    article = get_object_or_404(models.Article, id=request.data['articleId'])

    if article.like_users.filter(id=user.id).exists():
        article.like_users.remove(user)
        article.num_of_like -= 1
        article.save()
        return (Response("dislike"))
    else:
        article.like_users.add(user)
        article.num_of_like += 1
        article.save()
        return Response("like")


@api_view(['GET'])
def details(request, article_id):
    article = get_object_or_404(models.Article, pk=article_id)
    article_details = serializers.ArticleSerializer(article)
    return Response(article_details.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update(request, article_id):
    article = get_object_or_404(models.Article, pk=article_id)
    if article.user == request.user:
        up_article = serializers.ArticleSerializer(article, data=request.data)
        if up_article.is_valid(raise_exception=True):
            up_article.save(user=request.user)
            return Response(up_article.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def delete(request, article_id):
    article = get_object_or_404(models.Article, pk=article_id)
    if article.user == request.user or request.user.is_superuser:
        article.delete()
        return Response("게시글이 삭제되었습니다.")


@api_view(['GET'])
def commentsAll(request, article_id):
    article = get_object_or_404(models.Article, pk=article_id)
    comments = models.Comment.objects.order_by('-pk').filter(article=article)
    comments_All = []
    for comment in comments:
        comment = serializers.CommentSerializer(comment)
        comments_All.append(comment.data)
    return Response(comments_All)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request, article_id):
    print('데이터:', request.data)
    article = get_object_or_404(models.Article, pk=article_id)
    new_comment = serializers.CommentSerializer(data=request.data)
    if new_comment.is_valid(raise_exception=True):
        new_comment.save(user=request.user, article=article)
        return Response(new_comment.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_comment(request, article_id, comment_id):
    article = get_object_or_404(models.Article, pk=article_id)
    comment = get_object_or_404(models.Comment, pk=comment_id)
    if comment.user == request.user:
        up_comment = serializers.CommentSerializer(comment, data=request.data)
        if up_comment.is_valid(raise_exception=True):
            up_comment.save(user=request.user, article=article)
            return Response(up_comment.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def del_comment(request, comment_id):
    comment = get_object_or_404(models.Comment, pk=comment_id)
    if comment.user == request.user or request.user.is_superuser:
        comment.delete()
        return Response("댓글이 삭제되었습니다.")


@api_view(['GET'])
def replysAll(request, comment_id):
    comment = get_object_or_404(models.Comment, pk=comment_id)
    replys = models.Reply.objects.order_by('-pk').filter(comment=comment)
    replys_All = []
    for reply in replys:
        replys_All.append(serializers.ReplySerializer(reply).data)
    return Response(replys_All)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reply(request, comment_id):
    comment = get_object_or_404(models.Comment, pk=comment_id)
    new_reply = serializers.ReplySerializer(data=request.data)
    if new_reply.is_valid(raise_exception=True):
        new_reply.save(user=request.user, comment=comment)
        return Response(new_reply.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_reply(request, comment_id, reply_id):
    comment = get_object_or_404(models.Comment, pk=comment_id)
    reply = get_object_or_404(models.Reply, pk=reply_id)
    if reply.user == request.user:
        up_reply = serializers.ReplySerializer(reply, data=request.data)
        if up_reply.is_valid(raise_exception=True):
            up_reply.save(user=request.user, comment=comment)
            return Response(up_reply.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def del_reply(request, reply_id):
    reply = get_object_or_404(models.Reply, pk=reply_id)
    if reply.user == request.user or request.user.is_superuser:
        reply.delete()
        return Response("답글이 삭제되었습니다.")
