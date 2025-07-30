export const users = [
  { username: "admin", password: "admin123", redirect: "/dashboard" },
  { username: "aziz", password: "aziz123", redirect: "/aziz" },
  { username: "anas", password: "anas123", redirect: "/anas" },
  { username: "hamza", password: "hamza123", redirect: "/hamza" },
];

export function authenticate(username: string, password: string) {
  return users.find(user => user.username === username && user.password === password);
}
