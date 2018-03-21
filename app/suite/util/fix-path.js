const { spawn } = require('child_process');

const getUnixShellEnvironment = () => {
  return new Promise((resolve, reject) => {
    const runAsNode = process.env['ELECTRON_RUN_AS_NODE'];
    const noAttach = process.env['ELECTRON_NO_ATTACH_CONSOLE'];
    const mark = 'JARVIS';
    const regex = new RegExp(mark + '(.*)' + mark);

    const env = Object.assign({}, process.env, {
      ELECTRON_RUN_AS_NODE: '1',
      ELECTRON_NO_ATTACH_CONSOLE: '1'
    });

    const command = `'${process.execPath}' -p '"${mark}" + JSON.stringify(process.env) + "${mark}"'`;
    const child = spawn(process.env.SHELL, ['-ilc', command], {
      detached: true,
      stdio: ['ignore', 'pipe', process.stderr],
      env
    });

    const buffers = [];
    child.on('error', e => reject(e));
    child.stdout.on('data', b => buffers.push(b));

    child.on('close', (code, signal) => {
      if (code !== 0) {
        return reject(new Error('Failed to get environment'));
      }

      const raw = Buffer.concat(buffers).toString('utf8');
      const match = regex.exec(raw);
      const rawStripped = match ? match[1] : '{}';

      try {
        const env = JSON.parse(rawStripped);

        if (runAsNode) {
          env['ELECTRON_RUN_AS_NODE'] = runAsNode;
        } else {
          delete env['ELECTRON_RUN_AS_NODE'];
        }

        if (noAttach) {
          env['ELECTRON_NO_ATTACH_CONSOLE'] = noAttach;
        } else {
          delete env['ELECTRON_NO_ATTACH_CONSOLE'];
        }

        // https://github.com/Microsoft/vscode/issues/22593#issuecomment-336050758
        delete env['XDG_RUNTIME_DIR'];

        resolve(env);
      } catch (err) {
        reject(err);
      }
    });
  });
};

module.exports = getUnixShellEnvironment;
