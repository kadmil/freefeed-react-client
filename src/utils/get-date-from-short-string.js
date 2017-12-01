import moment from "moment";

function getDateParamsFromString(dateString) {
  return {
    year: dateString.substring(0, 4),
    month: dateString.substring(4, 6),
    date: dateString.substring(6, 8),
  };
}

export function getDateForMemoriesRequest(dateString) {
  const { year, month, date } = getDateParamsFromString(dateString);
  return new Date(year, Number(month) - 1, Number(date) + 1);
}

export function formatDateFromShortString(dateString) {
  const { year, month, date } = getDateParamsFromString(dateString);
  const fullDate = new Date(year, Number(month) - 1, date);
  return moment(fullDate).format("MMM D, YYYY");
}
