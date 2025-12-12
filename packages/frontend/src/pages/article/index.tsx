import { FC } from "react";
import { useParams } from "react-router-dom";
import { ArticleContent } from "./article";

const Article: FC = () => {
  const params = useParams();
  const currentArticleId = params.articleId;

  return (
    <ArticleContent
      // 确保老文章不会污染新文章的状态
      key={currentArticleId}
      currentArticleId={currentArticleId!}
    />
  );
};

export default Article;
