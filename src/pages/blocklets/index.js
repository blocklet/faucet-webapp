import React, { useEffect, useContext, useState } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';
import useLocalStorage from 'react-use/lib/useLocalStorage';
import { LocaleContext } from '@arcblock/ux/lib/Locale/context';
import Box from '@material-ui/core/Box';
import orderBy from 'lodash/orderBy';
import Alert from '@arcblock/ux/lib/Alert';
import Button from '@arcblock/ux/lib/Button';
import ButtonGroup from '@arcblock/ux/lib/ButtonGroup';
import ArrowDownwardSharpIcon from '@material-ui/icons/ArrowDownwardSharp';
import ArrowUpwardSharpIcon from '@material-ui/icons/ArrowUpwardSharp';
import CircularProgress from '@material-ui/core/CircularProgress';

import Empty from '../../components/empty';
import BlockletList from '../../components/list';
import Layout from '../../components/layout';
import api from '../../libs/api';
import { formatError } from '../../libs/util';

const SortIcon = ({ direction }) => (direction === 'desc' ? <ArrowDownwardSharpIcon /> : <ArrowUpwardSharpIcon />);

SortIcon.propTypes = {
  direction: PropTypes.string,
};
SortIcon.defaultProps = {
  direction: 'asc',
};

export default function BlockletListPage() {
  const { t } = useContext(LocaleContext);
  const [blocklets, setBlocklets] = useState([]);
  const [directions, setDirections] = useLocalStorage('directions', { title: 'asc', popularity: 'desc' });
  const [mainFactor, setMainFactor] = useLocalStorage('popularity', 'popularity');

  const onSortList = (list) => {
    const sortByName = (x) => x.title || x.name;
    const sortByPopularity = (x) => x.stats.downloads;

    const sortLists = orderBy(
      list,
      mainFactor === 'title' ? [sortByName, sortByPopularity] : [sortByPopularity, sortByName],
      mainFactor === 'title' ? [directions.title, directions.popularity] : [directions.popularity, directions.title]
    );

    setBlocklets(sortLists);
  };

  const state = useAsyncRetry(async () => {
    const { data: list } = await api.get('/api/blocklets.json?source=webapp');
    onSortList(list);
    return { list };
  });

  const handleSort = (property, sort) => {
    const newSort = sort === 'desc' ? 'asc' : 'desc';
    setDirections({ ...directions, [property]: newSort });
    setMainFactor(property);
  };

  useEffect(() => {
    onSortList(blocklets);
  }, [directions, mainFactor]); // eslint-disable-line

  let content = null;
  if (state.error) {
    content = (
      <Alert type="error" variant="icon">
        <div>{formatError(state.error)}</div>
      </Alert>
    );
  } else if (state.loading) {
    content = <CircularProgress />;
  } else if (blocklets.length) {
    content = <BlockletList blocklets={blocklets} />;
  } else {
    content = <Empty />;
  }

  return (
    <Layout title="Blocklet Registry" brand="Blocklet Registry">
      <Main>
        <Box className="marketplace-header" display="flex" justifyContent="space-between" p={0} m={0}>
          <Box mt={0}>
            <ButtonGroup size="small" color="primary" aria-label="split button">
              <Button
                onClick={() => handleSort('popularity', directions.popularity)}
                endIcon={<SortIcon direction={directions.popularity} />}
                className="sort-button"
                color="secondary"
                variant={mainFactor === 'popularity' ? 'contained' : 'outlined'}>
                {t('blockletList.popularSort')}
              </Button>
              <Button
                onClick={() => handleSort('title', directions.title)}
                endIcon={<SortIcon direction={directions.title} />}
                className="sort-button"
                color="secondary"
                variant={mainFactor === 'title' ? 'contained' : 'outlined'}>
                {t('blockletList.nameSort')}
              </Button>
            </ButtonGroup>
          </Box>
        </Box>
        {content}
      </Main>
    </Layout>
  );
}

const Main = styled.main`
  .marketplace-header {
    justify-content: flex-end;
    margin-bottom: 20px;
  }
`;
