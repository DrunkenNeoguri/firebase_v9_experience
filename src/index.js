// For Firebase JS SDK v7.20.0 and later, measurementId is optional

// 강의 내용은 아래의 링크를 참고함
// https://youtube.com/playlist?list=PL4cUxeGkcC9jERUGvbudErNCeSZHWUVlb

// 설정 초기화를 해줄 모듈을 가져옴.
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

// firebase 초기 설정
const firebaseConfig = {
  apiKey: "**********************",
  authDomain: "**********************",
  projectId: "**********************",
  storageBucket: "**********************",
  messagingSenderId: "**********************",
  appId: "**********************",
  measurementId: "**********************",
};

// 초기 설정값을 기준으로 firebase의 앱 설정 초기화
initializeApp(firebaseConfig);

// 파이어베이스 데이터베이스(파이어스토어)
// 파이어베이스의 파이어스토어를 변수를 통해 초기화하여 가져옴.
const db = getFirestore();

// 참고할 파이어스토어의 컬렉션을 가져옴.
const colRef = collection(db, "books");

// 컬렉션 값 가져오기
getDocs(colRef)
  .then((snapshot) => {
    let books = [];
    snapshot.docs.forEach((doc) => {
      books.push({ ...doc.data(), id: doc.id });
      // .data 메소드는 컬렉션 내 문서 속 필드 데이터를 받아오는 메소드이다.
    });
    console.log(books);
  })
  .catch((err) => {
    console.log(err.message);
  });

// 컬렉션에 문서를 추가
const addBookForm = document.querySelector(".add");
addBookForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // 컬렉션에 문서를 추가해주는 Firestore의 함수
  addDoc(colRef, {
    title: addBookForm.title.value,
    author: addBookForm.author.value,
  }).then(() => {
    // HTMLFormElement.reset()
    // button type="reset" 눌러서 form 내용을 초기화하는 것과 같은 역할을 하는 DOM 내장 메소드
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset
    addBookForm.reset();
  });
});

// 컬렉션에 문서를 삭제
const deleteBookForm = document.querySelector(".delete");
deleteBookForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // 컬렉션에서 id에 해당하는 문서를 찾아 변수에 초기화함.
  const docRef = doc(db, "books", deleteBookForm.id.value);

  deleteDoc(docRef).then(() => {
    deleteBookForm.reset();
  });
});

// 컬렉션에 문서를 갱신
const updateForm = document.querySelector(".update");
updateForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // 컬렉션에서 id에 해당하는 문서를 찾아 변수에 초기화함.
  const docRef = doc(db, "books", updateForm.id.value);

  updateDoc(docRef, {
    title: updateForm.title.value,
  }).then(() => updateForm.reset());
});

// 참고할 컬렉션에서 author가 patrick rothfuss인 쿼리를 찾아내기
const q = query(colRef, where("author", "==", "patrick rothfuss"));
// 쿼리? 데이터베이스나 파일의 내용 중 원하는 내용을 검색하기 위하여 몇 개의 코드(code)나 키(Key)를 기초로 질의하는 것을 말한다.

// 실시간으로 컬렉션의 데이터 받아오기
// 위의 쿼리를 통해 조건을 만족하는 친구들은 onSnapShot의 promise fulfilled에 따라 console.log(books)를 통해 출력된다.
onSnapshot(q, (snapshot) => {
  let books = [];
  snapshot.docs.forEach((doc) => {
    books.push({ ...doc.data(), id: doc.id });
    // .data 메소드는 컬렉션 내 문서 속 필드 데이터를 받아오는 메소드이다.
  });
  console.log(books);
});

// 하나의 문서만 받아오기 getDoc vs onSnapshot
const docRef = doc(db, "books", "3ujvXzDxvGerK5mS7wW1");

getDoc(docRef).then((doc) => {
  console.log(doc.date(), doc.id);
});

onSnapshot(docRef, (doc) => {
  console.log(doc.data(), doc.id);
});

// getDoc은 요청에 의해서 필요할 때에 문서를 가져오지만, 데이터가 바뀔 때마다 가져오는 건 아님
// onSnapShot은 데이터 변경이 일어날 때마다 리액트가 렌더되듯이 바로바로 가져옴

// 왜 snapshot일까?
// snapshot: 특정 시점의 시스템을 포착해 보관하는 기술
// 최초에 콜을 하면 즉시 해당 문서의 스냅샷이 생성되  고 그걸 받아올 수 있고 이후 변경이 생길때마다 스냅샷을 업데이트 해준다.
// 즉, 최초에 콜을 보낼 때 콜을 받을 당시의 데이터 상태를 받아온다는 의미에서 스냅샷이라고 하는 것 같다.
// 이런 점에선 변경점만 바로바로 적용해서 보여주므로 실시간으로 변경되는 듯한 느낌을 줄 수 있다.

// 파이어베이스 계정 인증
// 파이어베이스의 인증 모듈을 변수를 통해 초기화하여 가져옴.
const auth = getAuth();

// 이메일과 비밀번호를 통한 일반 회원가입 구현
const signupForm = document.querySelector(".signup");
signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // 유저의 이메일과 비밀번호 받아오기
  const email = signupForm.email.value;
  const password = signupForm.password.value;

  // 이메일과 비밀번호를 통해 유저를 생성해주는 firebase auth의 모듈을 이용
  // 인자로 firebase의 인증 모듈과 이메일, 비밀번호를 가져옴.
  createUserWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      console.log("user created: ", cred.user);
      signupForm.reset();
    })
    .catch((err) => console.log(err.message));
});

// 로그인 로그아웃 구현
const logoutButton = document.querySelector(".logout");
logoutButton.addEventListener("click", () => {
  // 로그아웃 기능을 제공해주는 firebase auth의 모듈을 이용
  signOut(auth)
    .then(() => {
      // console.log("the user signed out");
    })
    .catch((err) => console.log(err.message));
});

const loginForm = document.querySelector(".login");
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;

  // 이메일과 비밀번호를 통해 유저를 로그인시켜주는 firebase auth의 모듈을 이용
  signInWithEmailAndPassword(auth, email, password)
    .then((cred) => {
      // console.log("user logged in: ", cred.user);
    })
    .catch((err) => console.log(err.message));
});

// 현재 페이지에서 유저의 로그인 상태를 구독함
// 해당 함수는 체크하는 함수가 아니라 로그인 상태를 변경해주는 함수.
// 강의에서 subscribe라고 하는 건 전역에서 코드를 적용했기 때문에
// 변경될 때마다 관련 코드가 계속해서 호출되어 불러와지기 때문에 subscribe라고 표현한 것 같다.
onAuthStateChanged(auth, (user) => {
  console.log("user status change: ", user);
});

// 컬렉션, 문서, 계정을 subscribe, 즉 계속 호출되게 하고 싶지 않을 경우.
// 아래와 같이 별도의 함수로 파서 그때그때마다 사용하도록 유도하면 된다.
const unsubButton = document.querySelector(".unsub");
unsubButton.addEventListener("click", () => {
  console.log("unsubscribing");

  unsubCol();
  unsubDoc();
  unsubAuth();
});

// 컬렉션
const unsubCol = onSnapshot(q, (snapshot) => {
  console.log(q);
  let books = [];
  snapshot.docs.forEach((doc) => {
    books.push({ ...doc.data(), id: doc.id });
  });
  console.log(books);
});

// 문서
const unsubDoc = onSnapshot(docRef, (doc) => {
  console.log(doc.data(), doc.id);
});

// 계정
const unsubAuth = onAuthStateChanged(auth, (user) => {
  console.log("user status change: ", user);
});
