# Minecraft Cords PWA

This app is for logging minecraft cordinates and data about them.
It was pased on [Your First Progressive Web App][codelab] codelab and then heavily modified.
It utilizes [The Ink & Parchment Map][map] to render the waypoints and display a map.
It also uses the Dropbox API to save and load data.

Since it is a PWA it will:
* Use responsive design, so it works on desktop or mobile.
* Be fast & reliable, using a service worker to precache the app resources
  (HTML, CSS, JavaScript, images) needed to run, and cache the weather data
  at runtime to improve performance.
* Be installable, using a web app manifest and the `beforeinstallprompt` event
  to notify the user it's installable.


## Feedback

This is a work in progress, if you find a mistake, please [file an issue][git-issue].


## License

Copyright 2019 Google, Inc.

Licensed to the Apache Software Foundation (ASF) under one or more contributor
license agreements. See the NOTICE file distributed with this work for
additional information regarding copyright ownership. The ASF licenses this
file to you under the Apache License, Version 2.0 (the “License”); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed
under the License is distributed on an “AS IS” BASIS, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the License for the
specific language governing permissions and limitations under the License.


[codelab]: https://codelabs.developers.google.com/codelabs/your-first-pwapp/
[map]: http://buildingwithblocks.info/
[git-issue]: https://github.com/MusicMonkey5555/minecraft-cords/issues
