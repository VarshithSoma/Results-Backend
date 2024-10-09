const XLSX = require("xlsx");
const workbook = XLSX.readFile(
  "../data/B.Tech-II-I-Regular-A22-2022-Batch (1).numbers"
);
var sheet_name_list = workbook.SheetNames;
console.log(sheet_name_list + "Line 6"); // getting as Sheet1

sheet_name_list.forEach(function (y) {
  var worksheet = workbook.Sheets[y];
  //getting the complete sheet
  //   console.log(worksheet);

  var headers = {};
  var data = [];
  for (z in worksheet) {
    if (z[0] === "!") continue;
    //parse out the column, row, and value
    var col = z.substring(0, 1);
    // console.log(col);

    var row = parseInt(z.substring(1));
    // console.log(row);

    var value = worksheet[z].v;
    // console.log(value);

    //store header names
    if (row == 1) {
      headers[col] = value;
      // storing the header names
      continue;
    }

    if (!data[row]) data[row] = {};
    data[row][headers[col]] = value;
  }
  //drop those first two rows which are empty
  data.shift();
  data.shift();
  console.log(data);
});
