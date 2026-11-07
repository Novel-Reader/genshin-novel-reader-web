import React, { useState } from "react";
import PropTypes from "prop-types";
import intl from "react-intl-universal";
import { BsBook, BsDownload } from "react-icons/bs";
import { FaRegCommentDots } from "react-icons/fa";
import { Modal } from "antd";
import BookDetailDialog from "../book-detail";

const MAX_VISIBLE_TAGS = 4;

function Book(props) {
  const [showDetail, setShowDetail] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const { novel } = props;
  const { id, author, brief, cover_photo, name, size, download_count, tag } = novel;
  const title = name?.lastIndexOf(".") > 0 ? name.slice(0, name.lastIndexOf(".")) : name;
  const tags = typeof tag === "string" ? tag.split(/[\n,]/).map((item) => item.trim()).filter(Boolean) : [];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const description = (brief || "").replace(/\s+/g, " ").trim();

  return (
    <div className="book">
      <div className="book-left">
        {cover_photo && !coverFailed ? (
          <img src={cover_photo} alt={`${title}封面`} onError={() => setCoverFailed(true)} />
        ) : (
          <div className="book-cover-placeholder">
            <BsBook aria-hidden="true" />
            <span>暂无封面</span>
          </div>
        )}
      </div>
      <div className="book-right">
        <div className="book-right-name" title={title}>{title}</div>
        <div className="book-right-author">{author || "佚名"}</div>
        <div className="book-right-meta">
          <span>字数：{size || 0}</span>
          <span aria-hidden="true">·</span>
          <span>下载：{download_count || 0}</span>
        </div>
        <p className="book-right-detail" title={description}>{description}</p>
        <div className="book-right-tags">
          {visibleTags.map((item, index) => (
            <span className="book-right-tag" key={`${item}-${index}`}>{item}</span>
          ))}
          {tags.length > MAX_VISIBLE_TAGS && (
            <button className="book-right-tags-more" type="button" onClick={() => setShowAllTags(true)}>
              +{tags.length - MAX_VISIBLE_TAGS}
            </button>
          )}
        </div>
        <div className="book-right-actions">
          <button className="icon" type="button" aria-label={intl.get("Comment")} onClick={() => setShowDetail(true)}>
            <FaRegCommentDots />
          </button>
          <button className="icon" type="button" aria-label={intl.get("Downloads")} onClick={() => props.downLoadNovel(id)}>
            <BsDownload />
          </button>
        </div>
      </div>
      <Modal
        open={showAllTags}
        onCancel={() => setShowAllTags(false)}
        footer={null}
        title="全部标签"
        width={420}
      >
        <div className="book-all-tags">
          {tags.map((item, index) => (
            <span className="book-right-tag" key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </Modal>
      {showDetail &&
        <BookDetailDialog
          downLoadNovel={props.downLoadNovel}
          novel={novel}
          toggleDialog={() => setShowDetail(false)}
        />
      }
    </div>
  );
}

Book.propTypes = {
  novel: PropTypes.object.isRequired,
  downLoadNovel: PropTypes.func.isRequired,
};

export default Book;
