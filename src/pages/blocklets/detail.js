/* eslint-disable react/jsx-one-expression-per-line */
import React, { useContext } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import { isFreeBlocklet } from '@blocklet/meta/lib/payment';
import NP from 'number-precision';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Tag from '@arcblock/ux/lib/Tag';
import ImageGallery from 'react-image-gallery';
import Alert from '@arcblock/ux/lib/Alert';
import Button from '@arcblock/ux/lib/Button';
import ExternalLink from '@material-ui/core/Link';

import Stats from '../../components/stats';
import renderAst from '../../components/render-ast';
import api from '../../libs/api';
import Layout from '../../components/layout';

import 'github-markdown-css/github-markdown.css';
import 'react-image-gallery/styles/css/image-gallery.css';

import {
  formatRegistryScreenshotPath,
  parseRegistryUrl,
  formatPerson,
  formatError,
  formatTimeFromNow,
  formatToDatetime,
} from '../../libs/util';

const formatShare = (value) => `${value * 100}%`;

const changeImgSrc = (children, prefix) => {
  children.forEach((child) => {
    if (
      child.tagName &&
      child.tagName === 'img' &&
      child.properties &&
      child.properties.src &&
      !child.properties.src.startsWith('http')
    ) {
      child.properties.src = `${prefix}${child.properties.src}`;
      if (child.properties.srcSet && Array.isArray(child.properties.srcSet)) {
        child.properties.srcSet = child.properties.srcSet.map((item) => {
          if (!item.startsWith('http')) {
            return item;
          }
          return item;
        });
      }
    }
    if (child.children && Array.isArray(child.children) && child.children.length > 0) {
      changeImgSrc(child.children);
    }
  });
};

export default function BlockletDetail() {
  const { did } = useParams();
  const { t } = useContext(LocaleContext);
  const state = useAsyncRetry(async () => {
    const result = await api.get(`/api/blocklets/${did}/blocklet.json?source=webapp`);
    return result;
  });

  let prefix = window.env && window.env.apiPrefix ? `${window.env.apiPrefix}` : '/';
  prefix = window.blocklet && window.blocklet.prefix ? `${window.blocklet.prefix}` : '/';

  let content = null;
  if (state.value) {
    const {
      name,
      nftFactory,
      version,
      keywords,
      htmlAst,
      stats,
      screenshots = [],
      charging,
      author,
      documentation,
      repository,
      community,
      support,
      title,
      lastPublishedAt,
      color = 'primary',
    } = state.value.data;

    if (htmlAst && htmlAst.children && Array.isArray(htmlAst.children)) {
      changeImgSrc(htmlAst.children, prefix);
    }

    const { origin } = window.location;
    const isFree = isFreeBlocklet(state.value.data);
    let url;
    if (isFree) {
      url = `https://install.arcblock.io/?action=blocklet-install&meta_url=${encodeURIComponent(
        `${origin}${prefix}api/blocklets/${did}/blocklet.json`
      )}`;
    } else {
      url = `${prefix}store/purchase/${nftFactory}`;
    }
    const priceList = (charging.tokens || []).map((item) => ({
      symbol: item.symbol,
      price: item.price,
    }));

    if (charging.price) {
      priceList.unshift({
        symbol: charging.symbol,
        price: charging.price,
      });
    }

    const titleInfo = title || name;
    content = (
      <Div color={color}>
        <div className="meta">
          <Typography component="h2" variant="h2" className="title">
            {titleInfo}
            <span className="charging">
              <span className="charging__price">
                {isFree ? 'FREE' : `${priceList.map((item) => `${item.price} ${item.symbol}`).join(' + ')}`}
              </span>
              <span className="charging__tip">
                {isFree ? t('blockletDetail.payFree') : t('blockletDetail.payNeed')}
              </span>
            </span>
          </Typography>
          <Stats stats={stats} className="blocklet__stats" />
          <Typography component="p" className="tags">
            <Tag className="tag" type="reverse">
              v{version}
            </Tag>
            {Array.isArray(keywords) &&
              keywords.length > 0 &&
              keywords.map((keyword) => (
                <Tag className="tag" key={keyword}>
                  {keyword}
                </Tag>
              ))}
          </Typography>
        </div>
        <div className="markdown-body">
          <Grid container spacing={4}>
            {screenshots.length > 0 ? (
              <Grid item xs={12} md={8}>
                <ImageGallery
                  lazyLoad
                  showNav={false}
                  showThumbnails
                  showPlayButton={false}
                  showFullscreenButton={false}
                  showBullets
                  items={screenshots.map((x) => ({
                    original: prefix + formatRegistryScreenshotPath(did, x),
                    thumbnail: prefix + formatRegistryScreenshotPath(did, x),
                  }))}
                />
              </Grid>
            ) : (
              <Grid item xs={12} md={8}>
                <PostContent component="div" className="content-wrapper post-content">
                  {renderAst(htmlAst)}
                </PostContent>
              </Grid>
            )}
            <Grid item xs={12} md={4}>
              <Button
                className="action-button"
                component={ExternalLink}
                variant="contained"
                target="__blank"
                href={url}>
                {isFree ? t('common.install') : t('common.purchase')}
              </Button>
              <Typography component="ul" className="meta-info">
                {!!author && (
                  <li className="meta-info__row">
                    <span className="info-row__key">{t('common.author')}</span>
                    <span className="info-row__value">{formatPerson(author)}</span>
                  </li>
                )}
                {!!repository && !!repository.url && (
                  <li className="meta-info__row">
                    <span className="info-row__key">{t('common.repository')}</span>
                    <a
                      href={parseRegistryUrl(repository.url)}
                      target="_blank"
                      className="info-row__value"
                      title={repository.type}
                      rel="noreferrer">
                      {parseRegistryUrl(repository.url)}
                    </a>
                  </li>
                )}
                {!!community && (
                  <li className="meta-info__row">
                    <span className="info-row__key">{t('common.community')}</span>
                    <a href={community} target="_blank" className="info-row__value" rel="noreferrer">
                      {community}
                    </a>
                  </li>
                )}
                {!!documentation && (
                  <li className="meta-info__row">
                    <span className="info-row__key">{t('common.documentation')}</span>
                    <a href={documentation} target="_blank" className="info-row__value" rel="noreferrer">
                      {documentation}
                    </a>
                  </li>
                )}
                {!!support && (
                  <li className="meta-info__row">
                    <span className="info-row__key">{t('common.support')}</span>
                    <a href={`mailto:${support}`} target="_blank" className="info-row__value" rel="noreferrer">
                      {support}
                    </a>
                  </li>
                )}
                {lastPublishedAt && (
                  <li className="meta-info__row">
                    <span className="info-row__key">{t('common.lastPublishedAt')}</span>
                    <span className="info-row__value" title={formatToDatetime(lastPublishedAt)}>
                      {formatTimeFromNow(lastPublishedAt)}
                    </span>
                  </li>
                )}
                {!isFree && charging.shares.length && (
                  <li className="meta-info__row">
                    <span className="info-row__key">{t('blockletDetail.payDetail')}</span>
                    <ul className="info-row__value" style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9em' }}>
                      {charging.shares.map((item) => (
                        <li key={item.address}>
                          {item.name}: {formatShare(item.share)}
                          &nbsp;(
                          {priceList.map((price) => `${NP.times(price.price, item.share)} ${price.symbol}`).join(' + ')}
                          )
                        </li>
                      ))}
                    </ul>
                  </li>
                )}
              </Typography>
            </Grid>
          </Grid>
          {screenshots.length > 0 && (
            <PostContent component="div" className="content-wrapper post-content">
              {renderAst(htmlAst)}
            </PostContent>
          )}
        </div>
      </Div>
    );
  } else if (state.error) {
    content = (
      <Alert type="error" variant="icon">
        {formatError(state.error)}
      </Alert>
    );
  } else {
    content = <CircularProgress />;
  }

  return (
    <Layout title="Blocklet Registry" brand="Blocklet Registry">
      {content}
    </Layout>
  );
}

const codeFont = 'source-code-pro, Menlo, Monaco, Consolas, Courier New, monospace !important';
const Div = styled.div`
  margin: 24px 0;

  .title {
    font-size: 40px;
    font-weight: bold;
    color: ${(props) => props.theme.colors.primary};
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
    }
  }

  .charging {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
      margin-top: 16px;
      align-items: flex-start;
    }

    .charging__price {
      margin-bottom: 8px;
      color: ${(props) => props.theme.colors.blue};
    }

    .charging__tip {
      font-size: 14px;
      color: ${(props) => props.theme.colors.primary};
      font-weight: normal;
    }
  }

  .blocklet__stats {
    margin-bottom: 16px;
  }

  .tags {
    margin: 16px 0 48px;
    @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
      margin-bottom: 32px;
    }

    .tag {
      margin-right: 8px;
      text-transform: capitalize;
      &:last-of-type {
        margin-right: 0;
      }
    }
  }

  .action-button {
    width: 100%;
    padding: 8px 22px;
    border-radius: 0 !important;
  }

  .meta-info {
    list-style: none;
    padding: 0;
    margin: 24px 0;

    .meta-info__row {
      display: flex;
      line-height: 2;
    }

    .info-row__key {
      width: 130px;
      flex-shrink: 0;
      font-weight: 500;
    }
    .info-row__value {
      white-space: break-word;
      word-break: break-all;
    }
  }

  .sidebar-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .use-button {
    width: 100%;
  }

  .image-gallery {
    .image-gallery-thumbnail.active {
      border-color: ${(props) => props.theme.palette.primary.main};
    }
    .image-gallery-bullets .image-gallery-bullet {
      border-color: ${(props) => props.theme.palette.primary.main};
      box-shadow: none;
    }
    .image-gallery-bullets .image-gallery-bullet.active {
      background-color: ${(props) => props.theme.palette.primary.main};
    }
    .image-gallery-slide {
      .image-gallery-image {
        display: flex;
        justify-content: center;
        img {
          max-height: 600px !important;
          width: auto;
          margin: 0 auto;
          @media (max-width: ${(props) => props.theme.breakpoints.values.sm}px) {
            height: auto;
            max-height: auto;
          }
        }
      }
    }
  }

  .markdown-body .highlight pre,
  .markdown-body pre {
    background-color: #222;
    border-radius: 5px;
  }
  .markdown-body code {
    font-family: ${codeFont};
  }
  .markdown-body pre code {
    color: #fff;
    font-size: 14px;
    font-family: ${codeFont};
  }

  .markdown-body h1,
  .markdown-body h2,
  .markdown-body h3,
  .markdown-body h4,
  .markdown-body h5,
  .markdown-body h6 {
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: 16px;
    margin-top: 24px;
    border-bottom: none;
  }

  .markdown-body .CodeMirror pre {
    background: #f6f8fa !important;
  }

  .markdown-body .anchor {
    display: none;
  }
`;

const PostContent = styled(Typography)`
  width: 100%;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.5em;

  .alert-content {
    max-width: 100%;
    p:last-of-type {
      margin-bottom: 0;
    }
  }

  iframe {
    width: 100% !important;
  }

  a {
    color: ${(props) => props.theme.colors.blue};
  }
`;
