class MathUtilsClass {
  constructor() {}

  isInRange = (value, min, max) => {
    let numValue = Number(value);
    return !isNaN(numValue) && numValue >= min && numValue <= max;
  };

  roundDecimalPlaces = (num, precision) => {
    precision = Math.pow(10, precision);
    return Math.round((num + Number.EPSILON) * precision) / precision;
  };
}

const MathUtils = new MathUtilsClass();
