export default (initDate = new Date()) => {
  try {
    const dp = new DatePicker();
    dp.initialDate = initDate;
    return dp.pickDateAndTime();
  } catch (e) {
    return null;
  }
};
