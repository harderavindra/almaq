import { 
  format, 
  formatDistanceToNowStrict, 
  differenceInMinutes, 
  differenceInHours, 
  differenceInDays, 
  differenceInWeeks 
} from "date-fns";

/**
 * Format a date string to a readable format: 24 Mar 2025, 06:41 PM
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";
  return format(date, "dd MMM yyyy, hh:mm a");
};

/**
 * Format a date string to a relative time (5m ago, 3h ago) and a full formatted date.
 */
export const formatDateDistance = (dateString) => {
  if (!dateString) return { relative: "N/A", formatted: "N/A" };
  const date = new Date(dateString);
  if (isNaN(date)) return { relative: "Invalid Date", formatted: "Invalid Date" };

  let relativeTime;
  const now = new Date();
  const minutes = differenceInMinutes(now, date);
  const hours = differenceInHours(now, date);
  const days = differenceInDays(now, date);
  const weeks = differenceInWeeks(now, date);

  if (minutes < 60) {
    relativeTime = `${minutes}m ago`;
  } else if (hours < 24) {
    relativeTime = `${hours}h ago`;
  } else if (days < 7) {
    relativeTime = `${days}d ago`;
  } else {
    relativeTime = `${weeks}w ago`;
  }

  return {
    relative: relativeTime,
    formatted: format(date, "dd MMM yyyy, hh:mm a"),
  };
};

/**
 * Format a date string to a short format: 24 Mar, 6:41 PM
 */
export const formatShortDateTime = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";
  return format(date, "dd MMM, h:mm a");
};

/**
 * Format a date string to day and month only: 24 Jan
 */
export const formatShortDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";
  return format(date, "dd MMM");
};

/**
 * Format a date string to a strict relative time: 3 hours ago
 */
export const formatTimeAgoStrict = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";
  return formatDistanceToNowStrict(date, { addSuffix: true });
};

export const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";
    return format(date, "dd MMM yyyy");
    }