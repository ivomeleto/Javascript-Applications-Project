var PARSE_APP_ID = 'PZTgPTwfNSZGkvcgX8TOTlhYULH5UVye4sFwLu1Z';
var PARSE_REST_API_KEY = 'luAhPM8oOLWbqoQqW5R01BxCZE3oAZSw9zOvcXm6';
var PARSE_JS_KEY = 'qnyzBHvqusA1U4fjaQG4JZOngdWoBr65QZxMZKpj';
var PARSE_URL = 'https://api.parse.com/1/classes/album';

var count;
var picUrlArray = [];
var picURL;

window.onload = function() {
    getAlbumsDataFromParse();
};

function getAlbumsDataFromParse() {
    $('#albumlist').empty();
    $('#albumlist').append('<tr><td>Album name</td><td>Comments</td><td>Remove</td></tr></tr>');
    $.ajax({
        headers: {
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-REST-API-Key": PARSE_REST_API_KEY
        },
        url: PARSE_URL,
        method: 'GET',
        contentType: 'aplication/json',
        success: function (data) {
            data.results.forEach(function(album) {
                var id = "'"+album.objectId+"'";
                $('#albumlist').append('<tr>' +
                 '<td id = ' + id + ' onclick="albumClicked('+id+')">' + album.name + '</td>' +
                 '<td>' + album.comment + '</td>' +
                 '<td>' + '<button onclick="removeAlbum('+id+')" class="removeButt">' +
                 '-' +'</button>' + '</td>' +
                 '</tr>');
            });
        },
        error: function (data) {
            $('body').text('You fucked it up! Good job...');
        }
    });
}

function albumClicked (albumID) {
    galleryBuilder();
    Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
    var query = new Parse.Query('album');
    localStorage['albumID'] = albumID;
    query.get(albumID, {
      success: function(object) {
         $('#albumName').val(object.attributes.name);
      },
      error: function(object, error) {
        console.log(object);
        console.log(error);
      }
    });
    getPicsCount();
}

function addAlbum() {
    var name = $('#albumName').val();
        //TODO - ADD COMMENT INPUT SECTION !!!
    $.ajax({
        headers:{
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-REST-API-Key": PARSE_REST_API_KEY
        },
        url: PARSE_URL,
        method: 'POST',
        contentType: 'aplication/json',
        data: JSON.stringify({
             'name': name,
             'pics': [],
             'picsCount': 0,
             'comment': 'The comments section remains to be added...'
        //TODO - ADD COMMENT INPUT SECTION !!!
        }),
        success: function () {
            console.log('GJ! You successfuly created an album!');
            getAlbumsDataFromParse();
         },
        error: function (data) {
            $('body').text('You fucked it up! Good job...(Add failed!)');
        }
    });
}

function removeAlbum (albumID) {
    $.ajax({
        headers: {
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-REST-API-Key": PARSE_REST_API_KEY
        },
        url: PARSE_URL + '/' + albumID,
        method: 'DELETE',
        contentType: 'application/json',
        success: function() {
            getAlbumsDataFromParse();
            //console.log("GJ! You successfuly deleted object with ID = "+albumID);
        },
        error: function() {
            $('body').text('You fucked it up! Good job...(Remove failed!)');
        }
    });
}

function editAlbumPicArray (picArray) {
   $.ajax({
        headers: {
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-REST-API-Key": PARSE_REST_API_KEY
        },
        url: PARSE_URL + '/' + localStorage['albumID'],
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            'pics': picArray
        }),
        success: function() {
            getAlbumsDataFromParse();
            console.log("GJ! You successfuly updated album with ID = "+localStorage['albumID']);
            //console.log(picUrlArray);
            getPicsCount();

        },
        error: function() {
            $('body').text('You fucked it up! Good job...(Update failed!)');
        }
    });
}

function getPicsCount () {
    var getPicsArray = $.ajax({
        headers: {
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-REST-API-Key": PARSE_REST_API_KEY
        },
        url: PARSE_URL + '/' + localStorage['albumID'],
        method: 'GET',
        contentType: 'aplication/json',
    });
    getPicsArray.done(function (data) {
        count = data['pics'].length;
        picUrlArray = data['pics'];
        //console.log(localStorage['albumID']+ " " + count);
        setPicsCount(count);
    });
    getPicsArray.fail(function (error) {
        console.log(error);
    });
}

function setPicsCount(counter) {
    var set = $.ajax({
        headers: {
            "X-Parse-Application-Id": PARSE_APP_ID,
            "X-Parse-REST-API-Key": PARSE_REST_API_KEY
        },
        url: PARSE_URL + '/' + localStorage['albumID'],
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({
            'picsCount': counter
        })
    });
    set.done(function () {
        counter = 0;
    });
    set.fail(function (error) {
        console.log('shit');
    });
}

function galleryBuilder () {
    $('#gallery').empty();
    var index = 0;
    picUrlArray.forEach(function(photo){
        $('#gallery').append("<img src="+photo+" onclick=removeImg(picUrlArray,"+index+")>");
        //console.log(index);
        index++;
    });
}

function addImg() {
    Parse.initialize(PARSE_APP_ID, PARSE_JS_KEY);
    var picIndex  = count;
    // console.log('picIndex = ' + picIndex);
    function upload () {
        var fileUploadControl = $("#fileUploader")[0];
        if (fileUploadControl.files.length > 0) {
            var file = fileUploadControl.files[0];
            // console.log("counter = " + count);
            var name = picIndex + ".jpg";
            var parseFile = new Parse.File(name, file);
            parseFile.save().then(function(){
                picUrlArray[picIndex] = parseFile.url();
                picIndex++;
                editAlbumPicArray(picUrlArray);
                galleryBuilder();
                console.log(parseFile.url());
            }, function(error) {
                console.log("Error");
                console.dir(error);
            });
        }
    }
    upload();
}

function removeImg (array, imgIndex) {
    array.splice(imgIndex,1);
    console.log('removed '+imgIndex);
    galleryBuilder();
    editAlbumPicArray(array);
}
