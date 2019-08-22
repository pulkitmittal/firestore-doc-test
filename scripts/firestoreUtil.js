define('firestoreUtil', ['@firebase/app', '@firebase/firestore'], function(firebase, firestore) {
  // Initialize Cloud Firestore through Firebase
  firebase.initializeApp({
    apiKey: 'AIzaSyBhjhe_LoavsbDLX9T6eHEpmT-1THcQ7w0',
    authDomain: 'pulkit-firestore-doc-size-test.firebaseapp.com',
    databaseURL: 'https://pulkit-firestore-doc-size-test.firebaseio.com',
    projectId: 'pulkit-firestore-doc-size-test',
    storageBucket: '',
    messagingSenderId: '261318618251',
    appId: '1:261318618251:web:7089d07063d7df86'
  });

  db = firebase.firestore();

  /**
   * Get byte UTF-8 string length
   * @param {*} s 
   */
  function getUtf8Size(s) {
    return (encodeURIComponent(s).replace(/%../g, 'x').length);
  }

  /**
   * Calculates size of data in document
   * @param {*} d 
   * @param {*} singleItr 
   */
  function calculateDataSize(d, singleItr) {
    var s = 0;
    switch (typeof d) {
      case 'string': s += getUtf8Size(d) + 1; break;
      case 'number': s += 8; break;
      case 'boolean': s++; break;
      case 'undefined':
        s++; break;
      case 'object':
        if (d === null) {
          s++;
        } else if (!singleItr) {
          if (Array.isArray(d)) {
            for (var i of d) {
              s += calculateDataSize(i);
            }
          } else {
            // ??? The correct specification is unknown
            for (var k of Object.keys(d)) {
              var v = d[k];
              s += getUtf8Size(k) + 1;
              s += calculateDataSize(v);
            }
            s += 32;
          }
        }
        break;
      default:
        console.error(typeof d);
    }
    return s;
  }
  
  /**
   * Calculates size of single-field collection scope index
   * @param {*} d 
   * @param {*} documentNameSize 
   */
  function calculateIndexSize(d, documentNameSize) {
    // only for collection scope
    var size = 0;
    
    for (var k of Object.keys(d)) {
      var v = d[k];
  
      // The document name size of the indexed document
      var s = documentNameSize;
      
      // The document name size of the indexed document's parent document
      // ?? should documentNameSize be added, since there is no parent document
      // s += documentNameSize;
  
      // The string size of the indexed field name
      s += getUtf8Size(k) + 1;
  
      // 32 additional bytes
      s += 32;
  
      // The size of the indexed field value
      switch (typeof v) {
        case 'string': s += getUtf8Size(v) + 1; s = s * 2; break;
        case 'number': s += 8; s = s * 2; break;
        case 'boolean': s++; s = s * 2; break;
        case 'undefined': break;
        case 'object':
          if (v === null) {
            // s++;
          } else if (Array.isArray(v)) {
            // ?? 'array_contains' index size specification not known
            // for (var v1 of v) {
              // s += documentNameSize + 32;
              // s += calculateDataSize(v1);
            // }
          } else {
            for (var k1 of Object.keys(v)) {
              var v1 = v[k1];
              var s1 = documentNameSize;
              s1 += getUtf8Size(k1) + 1;
              switch (typeof v1) {
                case 'string': s1 += getUtf8Size(v1) + 1; break;
                case 'number': s1 += 8; break;
                case 'boolean': s1++; break;
                case 'undefined': break;
              }
              s1 += 32;
              s += s1 * 2;
            }
          }
          break;
      }
  
      console.log(k, s);
      size += s;
    }
  
    console.log('calculateIndexSize:', size);
    return size;
  }

  /**
   * Calculates total document size
   * @param {*} docKey
   * @param {*} data
   */
  function calculateTotalSize(docKey, data) {
    var documentNameSize = docKey.split('/').reduce((a,c) => {
      a += getUtf8Size(c) + 1;
      return a;
    }, 16);
    var sizeInBytes = documentNameSize + calculateDataSize(data);
    var indexSizeInBytes = calculateIndexSize(data, documentNameSize);

    return {
      sizeInBytes: sizeInBytes,
      indexSizeInBytes: indexSizeInBytes
    };
  }

  function setInFirestore(docKey, data) {
    return db.doc(docKey).set(data);
  }

  function getFirestoreData(docKey) {
    return db.doc(docKey).get();
  }

  return {
    calculateTotalSize: calculateTotalSize,
    setInFirestore: setInFirestore,
    getFirestoreData: getFirestoreData
  };
});
