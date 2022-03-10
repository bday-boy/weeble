const copyToClipboard = function (copyText) {
  const toast = document.querySelector('.toast');
  const showToast = (success) => {
    toast.classList.remove((!success ? 'bg-success' : 'bg-danger'));
    toast.classList.add((success ? 'bg-success' : 'bg-danger'));
    toast.querySelector('.toast-body').textContent = success ?
      'Copied to clipboard!'
      : 'Could not copy to clipboard.';
    const bsToast = bootstrap.Toast.getInstance(toast);
    bsToast.show();
  };

  /* TODO: Replace with popups, not alerts */
  if (!navigator.clipboard) {
    showToast(copyFallback(copyText));
    return;
  }
  navigator.clipboard.writeText(copyText)
    .then(() => showToast(true))
    .catch(() => showToast(copyFallback(copyText)));
};

const copyFallback = function (copyText) {
  const copier = document.createElement('textarea');
  copier.value = copyText;

  // Avoid scrolling to bottom
  copier.style.top = "0";
  copier.style.left = "0";
  copier.style.position = "fixed";

  document.body.appendChild(copier);
  copier.focus();
  copier.select();

  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    successful = false;
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(copier);
  return successful;
};

const copyFallbackFallback = function (copyText) {
  // create new text area and let the user copy manually
};
