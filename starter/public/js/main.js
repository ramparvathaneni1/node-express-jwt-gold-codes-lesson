console.log('main js loaded');
//
// $(document).ready(function () {
//   var $codesEl = $("#codes22");
//   $('#getCodes').on('click', function(event){
//     event.preventDefault();
//
//     // Saving the auth token
//
//     $.ajax({
//       url: 'http://localhost:3000/api/gold_codes',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       }
//     }).done(function(codes) {
//       $codesEl.textContent(codes);
//       console.log('codes', codes);
//     }).fail(function(err) {
//       console.log('Error: ', err);
//     });
//   });
// })
//
//
// // // Retrieving the auth token for use in an AJAX call
// // var token2 = localStorage.getItem('token');
// //
// // // $(document).ready(function() {
// //   $("#getCodes").on("click", {
// //     console.log(this);
// //     console.log($)
// //
// //     // console.log("get em");
// //
//   //   $.ajax({
//   //     url: 'http://localhost:3000/api/gold_codes',
//   //     headers: {
//   //       'Authorization': `Bearer ${localStorage.getItem('token')}`
//   //     }
//   //   }).done(function(codes) {
//   //     console.log('codes', codes);
//   //   }).fail(function(err) {
//   //     console.log('Error: ', err);
//   //   });
//   // });
// // // });
