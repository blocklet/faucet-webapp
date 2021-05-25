/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable import/prefer-default-export */
import dayjs from 'dayjs';

export const formatError = (error) => {
  if (Array.isArray(error.errors)) {
    return error.errors.map((x) => x.message).join('\n');
  }

  return error.message;
};

export function formatToDate(date = new Date()) {
  return dayjs(date).format('ll');
}

export function formatToDatetime(date = new Date()) {
  return dayjs(date).format('lll');
}

export function formatTimeFromNow(date = new Date()) {
  const startDate = dayjs(date);
  const endDate = dayjs();

  const diffDay = endDate.diff(startDate, 'day');

  return diffDay > 3 ? formatToDate(date) : startDate.fromNow();
}

export function getWebWalletUrl() {
  try {
    const url = window.localStorage.getItem('wallet_url');
    if (url) {
      return url;
    }
  } catch (err) {
    // Do nothing
  }

  return '';
}
