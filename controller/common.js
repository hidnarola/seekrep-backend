const fs = require("fs");
var common_helper = {};
const express = require("express");

/* Find Query */
common_helper.find = async (collection, data = {}, type) => {
  try {
    if (type == 1) {
      var data = await collection.findOne(data);
    } else {
      var data = await collection.find(data);
    }
    if (data || (data && data.length > 0)) {
      return {
        status: 1,
        message: "data found",
        data: data
      };
    } else {
      return { status: 2, message: "No data found" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while fetching data",
      error: err
    };
  }
};

/* Insert Query */
common_helper.insert = async (collection, data = {}) => {
  if (Object.keys(data).length > 0) {
    try {
      var insertObj = new collection(data);
      var data = await insertObj.save();
      if (data || data.length > 0) {
        return {
          status: 1,
          message: "Record inserted successfully.",
          data: data
        };
      } else {
        return { status: 2, message: "No data inserted" };
      }
    } catch (err) {
      return {
        status: 0,
        message: "Error occurred while inserting data",
        error: err
      };
    }
  } else {
    return {
      status: 0,
      message: "Enter data for insert",
      error: err
    };
  }
};

/* Insert Multiple Records Query */
common_helper.insertMany = async (collection, data = {}) => {
  if (data.length > 0) {
    try {
      var data = await collection.insertMany(data);
      if (data || data.length > 0) {
        return {
          status: 1,
          message: "Record inserted successfully.",
          data: data
        };
      } else {
        return { status: 2, message: "No data inserted" };
      }
    } catch (err) {
      return {
        status: 0,
        message: "Error occurred while inserting data",
        error: err
      };
    }
  } else {
    return {
      status: 0,
      message: "Enter data for insert"
      // error: err
    };
  }
};

/* Update Query */
common_helper.update = async (collection, id, data) => {
  try {
    var data2 = await collection.findOneAndUpdate(id, data, { new: true });
    if (data2) {
      return {
        status: 1,
        message: "Record updated successfully.",
        data: data2
      };
    } else {
      return { status: 2, message: "No data updated" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while updating data",
      error: err
    };
  }
};

/* Single Hard delete Query */
common_helper.delete = async (collection, id, data = {}) => {
  try {
    if (Object.keys(data).length > 0) {
      var data = await collection.findOneAndUpdate(id, data);
    } else {
      var data = await collection.remove(id);
    }
    if (data || data.length > 0) {
      return {
        status: 1,
        message: "Record deleted successfully.",
        data: data
      };
    } else {
      return { status: 2, message: "No data deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while updating data",
      error: err
    };
  }
};

/* Multiple Hard delete Query */
common_helper.multipledelete = async (collection, condition) => {
  try {
    var data = await collection.deleteMany({
      _id: { $in: condition }
    });
    if (data) {
      return {
        status: 1,
        message: "Record deleted successfully.",
        data: data
      };
    } else {
      return { status: 2, message: "No data deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while deleting data",
      error: err
    };
  }
};

/* Soft delete Query */
common_helper.updateMany = async (collection, condition) => {
  try {
    var data = await collection.updateMany(
      { _id: { $in: condition } },
      { $set: { is_del: true } }
    );
    if (data) {
      return {
        status: 1,
        message: "Record deleted successfully.",
        data: data
      };
    } else {
      return { status: 2, message: "No data deleted" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while deleting data",
      error: err
    };
  }
};

/* Count Number of Records Query */
common_helper.count = async (collection, data = {}) => {
  try {
    var data = await collection.find(data).countDocuments();
    if (data || (data && data.length > 0)) {
      return {
        status: 1,
        message: "data found",
        data: data,
        recordsTotal: data
      };
    } else {
      return { status: 2, message: "No data found", recordsTotal: data };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while fetching data",
      error: err
    };
  }
};
// common_helper.count = async (collection, data2 = {}) => {
//   try {
//     let data;
//     if (data) {
//       data = await collection.find(data2).countDocuments();
//       console.log("data get", data);
//     } else {
//       data = await collection.find().countDocuments();
//     }
//     if (data || (data && data.length > 0)) {
//       return {
//         status: 1,
//         message: "data found",
//         data: data,
//         recordsTotal: data
//       };
//     } else {
//       return { status: 2, message: "No data found", recordsTotal: data };
//     }
//   } catch (err) {
//     return {
//       status: 0,
//       message: "Error occurred while fetching data",
//       error: err
//     };
//   }
// };

/* List Data with pagination and sorting */
common_helper.findWithFilter = async (
  collection,
  data = {},
  start,
  limit,
  filteredrecords,
  sort = false
) => {
  try {
    var data = await collection
      .find(data)
      .collation({ locale: "en" })
      .skip(start)
      .limit(limit)
      .sort(sort);
    if (data || (data && data.length > 0)) {
      filteredrecords = filteredrecords.recordsTotal;
      return {
        status: 1,
        message: "data found",
        data: data,
        filteredrecords: data.length,
        recordsTotal: filteredrecords
      };
    } else {
      return { status: 2, message: "No data found" };
    }
  } catch (err) {
    return {
      status: 0,
      message: "Error occurred while fetching data",
      error: err
    };
  }
};

/* File Upload */
common_helper.fileUpload = async (mimetype, file) => {
  var filename;
  var dir = "uploads/";
  var mimetype = mimetype;
  if (mimetype.indexOf(file.mimetype) != -1) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    file.mv(dir + "/" + filename, function(err) {
      if (err) {
        status: global.gConfig.MEDIA_ERROR_STATUS;
        err: "There was an issue in uploading audio";
      } else {
        location = filename;
      }
    });
  } else {
    res.send({
      status: global.gConfig.VALIDATION_FAILURE_STATUS,
      err: "Image format is invalid"
    });
  }
};

module.exports = common_helper;
