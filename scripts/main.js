require(['utils', 'firestoreUtil'], function (utils, firestoreUtil) {
  
    function printSize(index, key) {
      var docKey = document.getElementById(key).value;
      var label = document.getElementsByTagName('label')[index];
      var text = document.getElementsByTagName('textarea')[index].value
      var data = utils.parseData(text);
      if (data === '') {
        label.textContent = 'Invalid JSON';
      } else {
        var size = firestoreUtil.calculateTotalSize(docKey, data);
        var sizeInBytes = size.sizeInBytes;
        var indexSizeInBytes = size.indexSizeInBytes;
        label.textContent = 'Size: ' + utils.commaSeparated(String(sizeInBytes))
          + ' bytes | Index Size: '
          + utils.commaSeparated(String(indexSizeInBytes))
          + ' bytes';
      }
    }
    
    function setInFirestore(index, key) {
      var docKey = document.getElementById(key).value;
      var text = document.getElementsByTagName('textarea')[index].value
      var data = utils.parseData(text);
    
      firestoreUtil.setInFirestore(docKey, data)
        .then(function () {
          console.log('Document successfully written!');
          getFirestoreData(docKey);
        })
        .catch(function (error) {
          console.error('Error adding document: ', error);
        });
    }
    
    function getFirestoreData(docKey) {
      firestoreUtil.getFirestoreData(docKey)
        .then(function (doc) {
          if (doc.exists) {
            console.log('Document key:', docKey);
            console.log('Document data:', doc.data());
          } else {
            console.log('No such document!');
          }
        })
        .catch(function (error) {
          console.log('Error getting document:', error);
        });
    }

    window.main = (function () {
      return {
        printSize: printSize,
        setInFirestore: setInFirestore,
        getFirestoreData: getFirestoreData
      };
    })();
});