import Process from "child_process";
const process = Process;
export const run = async () => {
  process.exec("chcp 65001");
  let rs = "";
  process.exec("echo abc", (error, stdout, stderr) => {
    if (error) throw error;
    console.log(stdout, stderr);
    rs = stdout || stderr;
  });
  await new Promise((resole) => setTimeout(resole, 3000));
  return rs;
};
