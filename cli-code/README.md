sfxr-cli
========

A command-line adaptation of [sfxr](http://www.drpetter.se/project_sfxr.html), by [David Humphrey](mailto:david.humphrey@senecac.on.ca).

This fork is maintained by [Roger Jungemann](http://thefifthcircuit.com).

What is sfxr?
=============

sfxr is a tool for creating procedurally-generated sound effects suitable for video games created in an 8-bit style. It can create lo-fi explosions, coin pickup sounds, jump sounds, various hit and attack sounds, and can even generate completely random sounds. Furthermore, you can mutate existing sounds.

The command-line version of sfxr can do all of the above, but has the advantage of having no additional dependencies beyond the C++ standard library.

Installation
============

First, clone the repository.

    git clone https://github.com/thefifthcircuit/sfxr-cli

Change into the repository's directory and run Rake to build the project (requires Ruby).

    cd sfxr-cli
    rake

    # Alternatively...

    cd sfxr-cli
    g++ main.cpp -o sfxr

To see the usage, run without any arguments:

    ./sfxr

To generate a random sound:

    ./sfxr --randomize --export random.wav

Try opening `random.wav` in your audio editor of choice to hear what was generated.

To mutate a sound:

    # First, create a sound but add an additional `--save` argument
    ./sfxr --randomize --save foo.txt --export foo.wav

    # Next, create a mutated sound
    ./sfxr --load foo.txt --mutate --export foo2.wav --save foo2.txt

    # Try creating a third mutated sound
    ./sfxr --load foo2.txt --mutate --export foo3.wav --save foo3.txt

More usage will be coming soon.

