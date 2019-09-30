'use strict';

module.exports = function (Venue) {


  Venue.updateVenue = async function (id, data, imagesId, properties, req, callback) {
    try {
      var venue = await Venue.findById(id);
      if (venue == null)
        throw Venue.app.err.global.authorization()
      data.branchId = venue.branchId
      data.instituteId = venue.instituteId

      await Venue.app.models.user.checkRoleBranchAdmin(venue.instituteId, venue.branchId, req)
      await Venue.app.dataSources.mainDB.transaction(async models => {
        const {
          venue
        } = models
        const {
          venueProperties
        } = models
        const {
          venueImages
        } = models

        await venueProperties.destroyAll({
          "venueId": id,
        })

        await venueImages.destroyAll({
          "venueId": id,
        })

        if (properties.length != 0) {
          properties.forEach(element => {
            element.venueId = id
          });
          await venueProperties.create(properties)
        }
        if (properties.imagesId != 0) {
          var imageData = []
          imagesId.forEach(element => {
            imageData.push({
              "venueId": id,
              "imageId": element
            })
          });
          await venueImages.create(imageData)
        }
        var oldVenue = await venue.findById(id);
        var newVenue = await oldVenue.updateAttributes(data)
        callback(null, newVenue)
      })
    } catch (error) {
      callback(error)

    }
  }

  Venue.activeVenue = async function (id, req, callback) {
    try {
      var venue = await Venue.findById(id);
      if (venue == null)
        throw Venue.app.err.global.authorization()
      await Venue.app.models.user.checkRoleBranchAdmin(venue.instituteId, venue.branchId, req)
      if (venue.status == 'active') {
        throw Venue.app.err.global.alreadyActive()
      }

      var newVenue = await venue.updateAttribute("status", "active")
      callback(null, newVenue)
    } catch (error) {
      callback(error)
    }
  };


  Venue.deactiveVenue = async function (id, req, callback) {
    try {
      var venue = await Venue.findById(id);
      if (venue == null)
        throw Venue.app.err.global.authorization()
      await Venue.app.models.user.checkRoleBranchAdmin(venue.instituteId, venue.branchId, req)

      if (venue.status == 'deactive') {
        throw Venue.app.err.global.alreadyDeactive()
      }

      var newVenue = await venue.updateAttribute("status", "deactive")
      callback(null, newVenue)
    } catch (error) {
      callback(error)
    }
  };

};
