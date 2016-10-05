/// *** Initialize List *** (using List.js)

// Pagination parameters (List.js plugin)
var paginationParams = {
  name: "listPages",
  paginationClass: "pagination",
  innerWindow: 2,
  outerWindow: 1
}

// Entries list parameters (List.js)
var options = {
  // valueNames: class names for the different values of each list item
  // page: how many items that should be visible at the same time. Default 200
  // item: ID of item template element
  valueNames: [
    'name',
    'departments',
    'website',
    'email',
    'description',
    {name: 'web1', attr: 'href'},
    {name: 'web2', attr: 'href'},
    {name: 'email2', attr: 'href'}
  ],
  page: 20,
  item: 'databaseitem',
  plugins:[ListPagination(paginationParams)]
};

// Make list (List.js)
var labsList = new List('labs', options);

/// *** Retrieve Data from Google Spreadsheet *** (using sheetrock.js)

// truncate text with expand functionality (using dotdotdot)
function createDots(element)
{
  element.dotdotdot({after:'a.toggle'});
  element.children().children('.closericon').hide();
  element.children().children('.openericon').show();
}
function destroyDots(element)
{
  element.trigger('destroy');
  element.children().children('.openericon').hide();
  element.children().children('.closericon').show();
}
function dotdotdotSetup()
{
  // dotdotdot setup
  var $truncateme = $('.truncateme');
  $truncateme.children().children('.openericon').show();
  $truncateme.children().children('.closericon').hide();
  $truncateme.dotdotdot({
    after:'a.toggle',
    watch:true,
    callback:function(isTruncated,orgContent){
      if (!isTruncated){
        $(this).children('.toggle').hide();
      }
    },
  });

  // $(".truncateme").trigger("isTruncated",function(isTruncated){
  //   if (!isTruncated){
  //     $(this).children('.toggle').hide();
  //   }
  // });

  // dotdotdot events
  $truncateme.on('click','a.toggle',
    function() {
      $(this).parent().toggleClass('opened');

      if ($(this).parent().hasClass('opened')) {
        destroyDots($(this).parent());
      }
      else {
        createDots($(this).parent());
      }

      return false;
    }
  );
}

// Update entries (sheetrock call)
var updateResults = function(error, options, response) {
  // Report error
  if(error){
    console.log("Errors:", error);
  }

  // Parse response from sheet, curate, and load
  var data = [];
  var i;
  var dotdotdotButton = "<a class='toggle' href='#''><span class='openericon'>[ + ]</span><span class='closericon'>[ - ]</span></a>";
  for (i = 1; i < response["rows"].length; i++) {
    response["rows"][i]["cells"]["web1"] = response["rows"][i]["cells"]["website"];
    response["rows"][i]["cells"]["web2"] = response["rows"][i]["cells"]["website"];
    response["rows"][i]["cells"]["email2"] = "mailto:" + response["rows"][i]["cells"]["email"];
    response["rows"][i]["cells"]["departments"] = response["rows"][i]["cells"]["departments"].replace(/; /g, "<br/>");
    response["rows"][i]["cells"]["description"] += dotdotdotButton;
    data.push(response["rows"][i]["cells"]);
  }
  console.log("Total number of entries:", i-1);
  $("#numberofresults").text(i-1 + " results matching your query");
  labsList.add(data);

  // Ready to present the entries!
  $("#loader").hide();
  $("#hr, .pager").show();

  dotdotdotSetup()
}

// Parameters for sheetrock.js
var params = {
  url: 'https://docs.google.com/spreadsheets/d/1hJSYPwbuKZiVFaqV2a1yIEkjrjbZ_Mz9XM4xSK0j-WQ/edit#gid=806509658',
  query: "select A,B,C,D,E,F",
  callback: updateResults,
  reset: true
};

// Hide entries while load entries (sheetrock)
$("#hr, .pager").hide();
sheetrock(params);

/// *** Filtering *** (using selective.js)
// Filter event set
$('#reset-button-id').click(function() {
  $('#searchbox').val('');
  var selectize1 = $("#categories")[0].selectize;
  selectize1.clear();
  labsList.search();
  labsList.filter();
});
