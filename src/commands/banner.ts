import command from '../../config.json';

const createBanner = (): string[] => {
  const banner: string[] = [];
  const isMobile = window.innerWidth <= 600;

  // Use config.asciiMobile if it exists and we're on mobile, otherwise default to config.ascii
  const asciiArt = (isMobile && command.asciiMobile) ? command.asciiMobile : command.ascii;

  banner.push("<br>")
  asciiArt.forEach((ele) => {
    let bannerString = "";
    //this is for the ascii art
    for (let i = 0; i < ele.length; i++) {
      if (ele[i] === " ") {
        bannerString += "&nbsp;";
      } else {
        bannerString += ele[i];
      }
    }

    let eleToPush = `<pre>${bannerString}</pre>`;
    banner.push(eleToPush);
  });
  banner.push("<br>");
  banner.push("Welcome to Webterm v1.1.1");
  banner.push("Type <span class='command'>'help'</span> for a list of all available commands.");
  banner.push(`Type <a href='${command.repoLink}' target='_blank'><span class='command'>'repo'</span></a> to view the GitHub repository.`);
  banner.push("<br>");
  return banner;
}

export const getBanner = () => createBanner();
