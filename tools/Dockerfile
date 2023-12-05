FROM node:21.2.0

# install nx
RUN npm i -g nx

# create user
RUN useradd -u 5000 -m appxx
RUN chsh -s /bin/bash appxx
USER appxx:appxx

# install foundry
RUN /bin/bash -c "curl -L https://foundry.paradigm.xyz | bash && /home/appxx/.foundry/bin/foundryup"
ENV PATH="$PATH:/home/appxx/.foundry/bin"

ENTRYPOINT /bin/bash