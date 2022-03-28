export default async () => {
  try {
    const dp = new DatePicker();
    dp.initialDate = new Date();
    return dp.pickDateAndTime();
  } catch (e) {
    return null;
  }
};
