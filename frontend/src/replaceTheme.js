import fs from 'fs';
import path from 'path';

const walkSync = function(dir, filelist) {
  const files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.jsx')) {
          filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const dir = 'c:/Users/dharm/OneDrive/Desktop/CareSync-1/frontend/src/pages/dashboards';
const files = walkSync(dir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    // Replace theme classes
    content = content.replace(/(?<![\-\/])bg-slate-900(?![\/\w])/g, 'bg-[#164237]');
    content = content.replace(/hover:bg-black/g, 'hover:bg-[#2D7D6F]');
    content = content.replace(/bg-black(?![\/\w])/g, 'bg-[#0D1F1C]');
    content = content.replace(/hover:bg-slate-900/g, 'hover:bg-[#164237]');
    content = content.replace(/hover:border-slate-900/g, 'hover:border-[#164237]');
    content = content.replace(/group-hover:bg-slate-900/g, 'group-hover:bg-[#164237]');
    content = content.replace(/group-hover:border-slate-900/g, 'group-hover:border-[#164237]');
    content = content.replace(/(?<![\-\/])border-slate-900/g, 'border-[#164237]');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated: ' + path.basename(file));
    }
});
