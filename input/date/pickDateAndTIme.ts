export default async (initDate = new Date()) => {
  try {
    const dp = new DatePicker();
    dp.initialDate = initDate;
    return await dp.pickDateAndTime();
  } catch (e) {
    return null;
  }
};
